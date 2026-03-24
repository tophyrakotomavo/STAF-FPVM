import { createClient } from "@/lib/supabase/server";

export default async function Blog() {
  const supabase = createClient();
  
  const { data: leadership } = await supabase
    .from("leadership")
    .select("*")
    .order("organization", { ascending: true });

  return (
    <div className="article">
      <div className="articleParent">
        {leadership?.map((leader) => (
          <div key={leader.id} className="blog">
            <h3>
              {leader.position} <br />
              {leader.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}
