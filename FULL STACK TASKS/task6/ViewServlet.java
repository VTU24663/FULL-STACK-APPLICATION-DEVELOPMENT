import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;

public class ViewServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/student_db", "root", "password");

            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery("SELECT * FROM daily_activity");

            PrintWriter out = response.getWriter();

            out.println("<html><body>");
            out.println("<h3>Activity Logs</h3>");

            out.println("<table>");
            out.println("<tr><th>Date</th><th>Action</th><th>Count</th></tr>");

            while (rs.next()) {
                out.println("<tr>");
                out.println("<td>" + rs.getString("date") + "</td>");
                out.println("<td>" + rs.getString("action_type") + "</td>");
                out.println("<td>" + rs.getInt("total_actions") + "</td>");
                out.println("</tr>");
            }

            out.println("</table>");
            out.println("</body></html>");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}